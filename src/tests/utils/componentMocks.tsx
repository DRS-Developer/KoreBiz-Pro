export const createImageUploadMock = (imageUrl = 'https://cdn.example/mock-upload.png') => ({
  default: ({ onChange }: any) => (
    <button type="button" onClick={() => onChange(imageUrl)}>
      mock-image-upload
    </button>
  ),
});

export const createImageUploadPlaceholderMock = (text = 'mock-image-upload') => ({
  default: () => <div>{text}</div>,
});

export const createFormSkeletonMock = (text = 'loading') => ({
  default: () => <div>{text}</div>,
});
