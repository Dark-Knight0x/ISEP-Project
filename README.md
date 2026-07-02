# MindTrack — Hệ thống Timeline sức khỏe & tâm lý sinh viên

Frontend JavaScript thuần + Backend Node.js (Express). Trọng tâm: **trục thời gian đa lớp**.

## Chạy
```bash
npm install
npm start        # http://localhost:3000
```

## Cấu trúc
- `server/index.js` — Express: dữ liệu timeline, AI baseline & phát hiện độ lệch, micro check-in (NLP thô), thang PSS, tài nguyên cứu trợ.
- `public/index.html` `styles.css` `app.js` — giao diện timeline 3 track.

## Đã hiện thực theo tài liệu
1. **Timeline đa lớp** — 3 track song song (Lịch trình / Thể chất / Tâm lý), thước giờ, playhead, cuộn ngày.
2. **Mã hóa màu** — nhịp tim vào vùng nguy hiểm (giờ thi) tự chuyển đỏ + sọc cảnh báo.
3. **AI Baseline** — GĐ1 học 14 ngày; GĐ2 phát hiện độ lệch (nhịp tim +15%).
4. **Micro check-in <30s** — emoji + câu ngắn, chấm điểm cảm xúc.
5. **Báo động đỏ phân tầng** — Nhẹ (thở Box Breathing) → Trung bình (đặt lịch tham vấn) → Nặng (bản đồ cứu trợ + hotline Ngày Mai 096.306.1414, AI tạm dừng).
6. **Privacy Center** — Xem / Xuất / Chia sẻ có đồng thuận / Xóa vĩnh viễn.
7. **PSS Validation** — đối chiếu điểm PSS với suy luận AI, hiển thị % trùng khớp.
