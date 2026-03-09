import time
import json
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

url = "https://onedrive.live.com/:x:/g/personal/cfeb88ff557cd727/IQCYM9qVgLQhS4oAg4ViTDFkAR_79tMtkDlHTepfBlux1RM?rtime=fNHMUFl43kg&redeem=aHR0cHM6Ly8xZHJ2Lm1zL3gvYy9jZmViODhmZjU1N2NkNzI3L0lRQ1lNOXFWZ0xRaFM0b0FnNFZpVERGa0FSXzc5dE10a0RsSFRlcGZCbHV4MVJN"

options = Options()
options.add_argument('--headless')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')

try:
    driver = webdriver.Chrome(options=options)
    driver.get(url)
    print("Page loaded. Waiting for excel viewer to render...")
    
    # Wait for the main canvas or grid to render
    time.sleep(15) 
    
    # Try capturing full body text or specific table elements
    # Since OneDrive uses complex iframes/canvas, we might need to grab all text
    page_source = driver.page_source
    body_text = driver.find_element(By.TAG_NAME, "body").text
    
    with open("onedrive_scrape.txt", "w") as f:
        f.write("--- BODY TEXT ---\n")
        f.write(body_text)
        
    print("Scrape complete. Saved to onedrive_scrape.txt")
except Exception as e:
    print(f"Error scraping: {e}")
finally:
    try:
        driver.quit()
    except:
        pass
