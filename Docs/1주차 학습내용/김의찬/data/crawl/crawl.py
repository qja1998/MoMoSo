from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import pandas as pd
import time

def search_book_and_get_reviews(book_title, english_title=None):
    search_title = english_title if english_title else book_title
    search_url = f"https://www.goodreads.com/search?q={search_title}"
    
    options = webdriver.ChromeOptions()
    options.add_argument('--headless=new')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-gpu')
    options.add_argument('--window-size=1920,1080')
    options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    
    try:
        print(f"'{search_title}' 검색 중...")
        driver.get(search_url)
        time.sleep(5)
        
        print("현재 페이지 URL:", driver.current_url)
        
        try:
            wait = WebDriverWait(driver, 10)
            book_element = wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "table.tableList tr:first-child a.bookTitle"))
            )
            
            book_url = book_element.get_attribute('href')
            print(f"책 URL: {book_url}")
            
            driver.get(book_url)
            time.sleep(5)
            
            print("리뷰 섹션 찾는 중...")
            # 리뷰 탭으로 이동
            reviews_button = wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "[aria-label='Reviews']"))
            )
            reviews_button.click()
            time.sleep(3)
            
            # 리뷰 정렬 변경 (최신순으로)
            sort_button = wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "[aria-label='Sort reviews']"))
            )
            sort_button.click()
            time.sleep(2)
            
            reviews_data = []
            total_reviews = 0
            
            while total_reviews < 10:
                print(f"현재 {total_reviews}개의 리뷰 수집됨...")
                
                try:
                    # 여러 가지 가능한 리뷰 선택자 시도
                    possible_selectors = [
                        "article.ReviewCard div.ReviewCard__content",
                        "div.ReviewText__content",
                        "section.ReviewText__content",
                        "[data-testid='reviewText']"
                    ]
                    
                    for selector in possible_selectors:
                        review_elements = driver.find_elements(By.CSS_SELECTOR, selector)
                        if review_elements:
                            print(f"선택자 {selector}에서 {len(review_elements)}개의 리뷰 발견")
                            for review in review_elements:
                                if total_reviews >= 10:
                                    break
                                
                                review_text = review.text.strip()
                                if review_text:
                                    reviews_data.append({
                                        'book_title': book_title,
                                        'review_text': review_text
                                    })
                                    total_reviews += 1
                                    print(f"리뷰 {total_reviews} 수집 완료")
                            break
                    
                    if total_reviews >= 10:
                        break
                    
                    # 다음 페이지로 이동
                    next_button = driver.find_element(By.CSS_SELECTOR, "button[aria-label='Next page']")
                    if next_button and next_button.is_enabled():
                        next_button.click()
                        time.sleep(3)
                    else:
                        print("더 이상 리뷰를 찾을 수 없습니다.")
                        break
                        
                except Exception as e:
                    print(f"현재 페이지에서 리뷰를 찾는 중 에러 발생: {e}")
                    driver.save_screenshot(f"error_reviews_page_{total_reviews}.png")
                    break
            
            if reviews_data:
                df = pd.DataFrame(reviews_data)
                filename = f"goodreads_reviews_{book_title[:30]}.csv"
                df.to_csv(filename, index=False, encoding='utf-8-sig')
                print(f"총 {len(reviews_data)}개의 리뷰를 수집했습니다.")
                return df
            else:
                print("수집된 리뷰가 없습니다.")
                return None
                
        except Exception as e:
            print(f"검색 결과를 찾는 중 에러 발생: {e}")
            driver.save_screenshot("error_page.png")
            print("에러 페이지 스크린샷을 저장했습니다.")
            return None
            
    finally:
        driver.quit()

# 실행
reviews_df = search_book_and_get_reviews("채식주의자", "The Vegetarian")