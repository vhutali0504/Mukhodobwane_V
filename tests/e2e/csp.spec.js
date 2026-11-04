import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'

// The policy under test is read from netlify.toml, so the two cannot drift.
const toml = readFileSync(new URL('../../netlify.toml', import.meta.url), 'utf8')
const CSP = toml.match(/Content-Security-Policy\s*=\s*"([^"]+)"/)?.[1]

test.describe('CSP from netlify.toml', () => {
  test.setTimeout(180_000)
  let consoleHits

  test.beforeEach(async ({ page }) => {
    expect(CSP, 'CSP found in netlify.toml').toBeTruthy()
    consoleHits = []
    page.on('console', (m) => {
      if (/Content Security Policy/i.test(m.text())) consoleHits.push(m.text())
    })
    await page.addInitScript(() => {
      window.__csp = []
      document.addEventListener('securitypolicyviolation', (e) =>
        window.__csp.push(`${e.violatedDirective} ${e.blockedURI}`),
      )
    })
    // Every document response gets the header, as Netlify would send it.
    await page.route('**/*', async (route) => {
      if (route.request().resourceType() !== 'document') return route.continue()
      const res = await route.fetch()
      return route.fulfill({ response: res, headers: { ...res.headers(), 'content-security-policy': CSP } })
    })
  })

  const violations = (page) => page.evaluate(() => window.__csp)
  async function expectClean(page) {
    expect(await violations(page)).toEqual([])
    expect(consoleHits).toEqual([])
  }

  test('formal page and contact submit', async ({ page }) => {
    await page.route('**/', (route) =>
      route.request().method() === 'POST' ? route.fulfill({ status: 200, body: 'ok' }) : route.fallback(),
    )
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
    await page.getByRole('button', { name: /KSMS/ }).click()
    await expectClean(page)
    await page.getByLabel('Name', { exact: true }).fill('Test Person')
    await page.getByLabel('Email', { exact: true }).fill('test@example.com')
    await page.getByLabel('Message', { exact: true }).fill('Hello, this is a test message.')
    await page.getByRole('checkbox').check()
    await page.getByRole('button', { name: 'Send message' }).click()
    await expect(page).toHaveURL(/\/thanks$/)
    await expectClean(page)
  })

  test('3D room', async ({ page }) => {
    await page.goto('/room?e2e3d=1')
    await expect(page.locator('.room-hint')).toContainText('click the desk', { timeout: 60_000 })
    await page.keyboard.press('Enter')
    await expect(page.locator('.room-hint')).toContainText('Esc to stand up', { timeout: 60_000 })
    await expectClean(page)
  })

  test('room fallback without WebGL', async ({ page }) => {
    await page.addInitScript(() => {
      delete window.WebGL2RenderingContext
      delete window.WebGLRenderingContext
    })
    await page.goto('/room')
    await expect(page.getByText("Your device can't run the 3D room")).toBeVisible({ timeout: 60_000 })
    await expectClean(page)
  })
})
