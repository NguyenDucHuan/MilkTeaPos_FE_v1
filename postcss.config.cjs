module.exports = {
  plugins: {
    '@tailwindcss/postcss7-compat': {},   // Xử lý các class của Tailwind => chuyển đổi các class tw thành css thuần
    autoprefixer: {},     // Tự động thêm các prefix cho CSS
  }
} 

// Cấu hình cho PostCSS, một công cụ để xử lý và biến đổi CSS
// Xác định các plugins sẽ được sử dụng để xử lý CSS
// Quy định thứ tự xử lý của các plugins

// //Kết nối Tailwind với PostCSS
// Tự động thêm vendor prefixes cho CSS (vd: -webkit-, -moz-)
// Cho phép sử dụng các tính năng CSS mới trên các trình duyệt cũ