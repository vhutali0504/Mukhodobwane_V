import { test, expect } from '@playwright/test'

// Software WebGL is slow: give the 3D specs generous timeouts.
const SLOW = { timeout: 60_000 }
const debug = (page) => page.evaluate(() => window.__roomDebug?.())

test.describe('3D room', () => {
  test.setTimeout(180_000)

  test('flow: sit, scan, open Skills, exit to formal', async ({ page }) => {
    // ?e2e3d=1 (test builds only) turns off the slow-FPS check and first-frame timeout.
    await page.goto('/room?e2e3d=1')
    const hint = page.locator('.room-hint')
    await expect(hint).toContainText('click the desk', SLOW)
    await page.keyboard.press('Enter')
    await expect(hint).toContainText('Esc to stand up', SLOW)
    await expect.poll(async () => (await debug(page))?.mode, SLOW).toBe('scan')
    await page.keyboard.press('Enter')
    await expect.poll(async () => (await debug(page))?.mode, SLOW).toBe('menu')
    await page.keyboard.type('2')
    await page.keyboard.press('Enter')
    await expect.poll(() => debug(page), SLOW).toEqual({ mode: 'section', sec: 1 })
    await page.keyboard.press('Escape')
    await expect(hint).toContainText('click the desk', SLOW)
    await page.getByRole('link', { name: 'Exit to formal' }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.locator('h1')).toBeVisible()
  })

  test('deep link and back', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Switch to hacker mode' }).click()
    await expect(page).toHaveURL(/\/room$/)
    await page.goBack()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.locator('h1')).toBeVisible()

    await page.goto('/room')
    await expect(page.getByRole('heading', { name: /hacker room/i })).toBeAttached()
    await expect(page.locator('.room')).toBeVisible(SLOW)
  })

  test('room fallback without WebGL', async ({ page }) => {
    await page.addInitScript(() => {
      delete window.WebGL2RenderingContext
      delete window.WebGLRenderingContext
      const orig = HTMLCanvasElement.prototype.getContext
      HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
        if (typeof type === 'string' && type.startsWith('webgl')) return null
        return orig.call(this, type, ...rest)
      }
    })
    await page.goto('/room')
    await expect(page.getByText("Your device can't run the 3D room")).toBeVisible(SLOW)
    await page.getByRole('button', { name: /trivia/ }).click()
    await expect(page.getByText(/TRIVIA · question 1/)).toBeVisible()
    await page.getByRole('button', { name: /^A:/ }).click()
    await expect(page.getByText(/correct\. \+1|nope\. the answer was/)).toBeVisible()
  })
})
