
# Cài đặt môi trường ảo hóa
```bash
python -m venv venv
# Khi này dự án sẽ tạo 1 thư mục venv
```

# Khởi động môi trường ảo hóa
## cd đến thư mục app
```bash
.\venv\Scripts\activate
```

# Chạy dự án từ điểm đầu vào file main.py
```bash
uvicorn main:app --reload
```

# Tắt ảo hóa
```bash
deactivate
```
