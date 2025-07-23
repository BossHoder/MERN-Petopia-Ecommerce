const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
        // Có thể log lỗi ở đây nếu muốn
        // console.error('Async error:', err);
        next(err);
    });
};

export default asyncHandler;
