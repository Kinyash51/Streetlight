import BookCover3D from "./BookCover3D";

export default function InteractiveBook() {
  return (
    <BookCover3D
      src="/images/book-cover.jpg"
      alt="The Drowned Streetlamp"
      width={380}
      height={570}
    />
  );
}
