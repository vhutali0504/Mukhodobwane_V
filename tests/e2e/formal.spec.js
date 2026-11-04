import { test, expect } from '@playwright/test'

const NAME = 'Mukhodobwane Vhutalihandivho'
const CV = '/cv/Mukhodobwane-Vhutalihandivho-CV.pdf'

test.describe('formal site', () => {
  test('title matches and h1 shows the full name', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(`${NAME} · Software Developer`)
    await expect(page.locator('h1')).toHaveText(new RegExp(NAME.replace(' ', '\\s+')))
  })

  test('Download CV responds 200 with application/pdf', async ({ page, request }) => {
    await page.goto('/')
    const href = await page.getByRole('link', { name: 'Download CV' }).first().getAttribute('href')
    expect(href).toBe(CV)
    const res = await request.get(href)
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toContain('application/pdf')
  })

  test('expanding KSMS shows its details', async ({ page }) => {
    await page.goto('/')
    const btn = page.getByRole('button', { name: /KSMS/ })
    await expect(btn).toHaveAttribute('aria-expanded', 'false')
    await btn.click()
    await expect(btn).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByRole('region', { name: /KSMS/ })).toBeVisible()
  })

  test('contact form shows errors when empty', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Send message' }).click()
    await expect(page.locator('.field-error').first()).toBeVisible()
    expect(await page.locator('.field-error').count()).toBeGreaterThanOrEqual(3)
    await expect(page).toHaveURL(/\/$/)
  })

  async function fillValid(page) {
    await page.goto('/')
    await page.getByLabel('Name', { exact: true }).fill('Test Person')
    await page.getByLabel('Email', { exact: true }).fill('test@example.com')
    await page.getByLabel('Message', { exact: true }).fill('Hello, this is a test message.')
    await page.getByRole('checkbox').check()
  }

  test('a valid submit posts to / and lands on /thanks', async ({ page }) => {
    let body = ''
    await page.route('**/', async (route) => {
      const req = route.request()
      if (req.method() !== 'POST') return route.continue()
      body = req.postData() ?? ''
      return route.fulfill({ status: 200, body: 'ok' })
    })
    await fillValid(page)
    await page.getByRole('button', { name: 'Send message' }).click()
    await expect(page).toHaveURL(/\/thanks$/)
    expect(body).toContain('form-name=contact')
  })

  test('a 500 shows the error message', async ({ page }) => {
    await page.route('**/', (route) =>
      route.request().method() === 'POST' ? route.fulfill({ status: 500, body: 'no' }) : route.continue(),
    )
    await fillValid(page)
    await page.getByRole('button', { name: 'Send message' }).click()
    await expect(page.getByRole('alert')).toContainText('Something went wrong')
    await expect(page).toHaveURL(/\/$/)
  })

  test('no horizontal scroll at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    for (const path of ['/', '/privacy', '/thanks']) {
      await page.goto(path)
      await expect(page.locator('h1')).toBeVisible()
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
      expect(scrollWidth, `${path} scrollWidth`).toBeLessThanOrEqual(320)
      const box = await page.locator('h1').boundingBox()
      expect(box.x, `${path} h1 left`).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width, `${path} h1 right`).toBeLessThanOrEqual(320)
    }
  })

  test('the page text does not contain the phone number', async ({ page }) => {
    await page.goto('/')
    expect(await page.locator('body').innerText()).not.toMatch(/(\+27|\b0)\s?\d{2}\s?\d{3}\s?\d{4}/)
  })

  test('/nope shows the 404 terminal and is noindex', async ({ page }) => {
    await page.goto('/nope')
    await expect(page.getByText('404: file not found')).toBeVisible()
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex')
  })

  test('pages get a canonical link and no robots tag', async ({ page }) => {
    await page.goto('/privacy')
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/privacy$/)
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0)
  })

  test('the hacker mode switch reaches /room', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Switch to hacker mode' }).click()
    await expect(page).toHaveURL(/\/room$/)
    await expect(page.getByRole('heading', { name: /hacker room/i })).toBeAttached()
  })
})
