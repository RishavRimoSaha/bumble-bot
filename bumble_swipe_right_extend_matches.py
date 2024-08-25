import asyncio
import random
import time
from playwright.async_api import async_playwright
from playwright.async_api import TimeoutError as PlaywrightTimeoutError


async def random_human_interactions(page, post_login=False):
    if post_login:
        actions = [
            lambda: page.keyboard.press("ArrowDown"),
            lambda: page.keyboard.press("ArrowUp"),
        ]
        num_actions = random.randint(2, 4)
        sleep_range = (2, 4)
    else:
        actions = [
            lambda: page.mouse.move(random.randint(0, 1000), random.randint(0, 1000)),
            lambda: page.mouse.click(random.randint(0, 1000), random.randint(0, 1000)),
            lambda: page.mouse.wheel(0, random.randint(-200, 200)),
            lambda: page.keyboard.press("ArrowDown"),
            lambda: page.keyboard.press("ArrowUp"),
            lambda: page.mouse.dblclick(
                random.randint(0, 1000), random.randint(0, 1000)
            ),
        ]
        num_actions = random.randint(2, 5)
        sleep_range = (2.5, 6.5)

    print(f"Performing {num_actions} random actions")
    for _ in range(num_actions):
        action = random.choice(actions)
        await action()
        delay = random.uniform(*sleep_range)
        print(f"Delay after action: {delay:.2f} seconds")
        await asyncio.sleep(delay)


async def navigate_to_page(page, url, timeout=180000, max_retries=3):
    for attempt in range(max_retries):
        try:
            start_time = time.time()
            print(f"Navigating to {url} (Attempt {attempt + 1})...")
            response = await page.goto(
                url, wait_until="domcontentloaded", timeout=timeout
            )
            await page.wait_for_load_state("networkidle")
            end_time = time.time()
            duration = end_time - start_time
            print(f"Navigation to {url} successful! Duration: {duration:.2f} seconds")
            return True
        except PlaywrightTimeoutError as e:
            print(f"Navigation to {url} failed: {e}")
            print(f"Page URL: {page.url}")
            if attempt < max_retries - 1:
                await asyncio.sleep(10)  # Wait 10 seconds before retrying
            else:
                return False


async def main():
    async with async_playwright() as p:
        print("Launching Brave browser...")
        browser = await p.chromium.launch(
            headless=False,
            executable_path="C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
            slow_mo=100,  # Slow down actions for better debugging
        )
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            java_script_enabled=True,  # Enable JavaScript
        )

        page = await context.new_page()

        for attempt in range(3):
            print(
                f"Navigating to https://bumble.com/get-started (Attempt {attempt + 1})..."
            )
            navigation_start = time.time()
            try:
                response = await page.goto(
                    "https://bumble.com/get-started",
                    wait_until="domcontentloaded",
                    timeout=180000,
                )
                await page.wait_for_selector(
                    'button:has-text("Use cell phone number")', timeout=60000
                )
                navigation_end = time.time()
                print(
                    f"Navigation successful! Duration: {navigation_end - navigation_start:.2f} seconds"
                )
                break
            except PlaywrightTimeoutError as e:
                print(f"Navigation attempt {attempt + 1} failed: {e}")
                print(f"Page URL during failure: {page.url}")
                print(f"Page content during failure: {await page.content()}")
                if attempt < 2:
                    await asyncio.sleep(10)  # Wait before retrying
                else:
                    print(
                        "Failed to navigate to the get-started page after 3 attempts."
                    )
                    await browser.close()
                    return

        try:
            await asyncio.sleep(5)  # Wait a bit to ensure the page has loaded
            if "get-started" in page.url:
                print("Detected get-started page.")
                print("Waiting for 'Use cell phone number' button...")
                button_start = time.time()
                use_phone_button = await page.wait_for_selector(
                    'button:has-text("Use cell phone number")', timeout=60000
                )
                if use_phone_button:
                    await random_human_interactions(page)
                    print("Clicking 'Use cell phone number' button...")
                    await use_phone_button.click()
                    button_end = time.time()
                    print(
                        f"Time taken from page load to clicking 'Use cell phone number' button: {button_end - navigation_end:.2f} seconds"
                    )
                    await asyncio.sleep(random.uniform(2.5, 6.5))  # Random delay
                else:
                    print("Failed to find 'Use cell phone number' button.")
                    return

                print("Waiting for phone number input field...")
                phone_number_field = await page.wait_for_selector(
                    'input[type="tel"]', timeout=60000
                )
                if phone_number_field:
                    await random_human_interactions(page)
                    print(
                        "Please enter your phone number manually in the provided field."
                    )
                    await page.wait_for_timeout(
                        120000
                    )  # Wait 2 minutes for manual phone number entry and CAPTCHA resolution
                else:
                    print("Failed to find phone number input field.")
                    return

                print("Waiting for manual entry and navigation to Bumble app...")
                start_time = time.time()
                while time.time() - start_time < 600000 / 1000:
                    if "app" in page.url:
                        print("Detected successful navigation to Bumble app.")
                        break
                    await asyncio.sleep(5)  # Check every 5 seconds

            else:
                print("Failed to detect get-started page.")
        except Exception as e:
            print(f"Login process failed: {e}")
            return

        async def extend_matches():
            """
            Extends all matches by clicking on each yellow bubble and then the "Extend 24 hrs." button.
            """
            try:
                print("Checking for match bubbles...")
                match_bubbles = await page.query_selector_all(
                    ".scrollable-carousel-item"
                )
                print(f"Found {len(match_bubbles)} match bubbles.")
                for bubble in match_bubbles:
                    bubble_class = await bubble.get_attribute("class")
                    print(
                        f"Bubble class: {bubble_class}"
                    )  # Log the class for debugging
                    if (
                        "contact-avatar--color-expiration-status-low" in bubble_class
                        or "contact-avatar--color-expiration-status-extended"
                        in bubble_class
                    ):
                        print("Found a yellow bubble match. Clicking on it...")
                        await bubble.click()
                        await asyncio.sleep(1)  # Wait for the match details to load

                        # Random human interactions (1 to 3 actions)
                        actions = [
                            lambda: page.keyboard.press("ArrowDown"),
                            lambda: page.keyboard.press("ArrowUp"),
                        ]
                        num_actions = random.randint(1, 3)
                        sleep_range = (2, 4)

                        print(
                            f"Performing {num_actions} random actions inside extend_matches"
                        )
                        for _ in range(num_actions):
                            action = random.choice(actions)
                            await action()
                            delay = random.uniform(*sleep_range)
                            print(f"Delay after action: {delay:.2f} seconds")
                            await asyncio.sleep(delay)

                        extend_button = await page.query_selector(
                            'button:has-text("Extend 24 hrs.")'
                        )
                        if extend_button:
                            print("Found 'Extend 24 hrs.' button. Clicking it...")
                            await extend_button.click()
                            print("Extended a match!")
                            await asyncio.sleep(
                                1
                            )  # Wait for the extend action to complete
                        else:
                            print("Failed to find 'Extend 24 hrs.' button.")

                        back_button = await page.query_selector(
                            'a:has-text("Back to meeting new people")'
                        )
                        if back_button:
                            print(
                                "Found 'Back to meeting new people' button. Clicking it..."
                            )
                            await back_button.click()
                            await asyncio.sleep(1)  # Wait to return to the main screen
                        else:
                            print("Failed to find 'Back to meeting new people' button.")
            except Exception as e:
                print("Failed to extend matches:", e)

        await extend_matches()  # Call extend_matches directly

        print("Script completed. Keeping the browser open.")
        while True:
            await asyncio.sleep(60)


# Run the main function
asyncio.run(main())
