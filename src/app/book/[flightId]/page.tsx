import { BookFlow } from "./book-flow";

type Props = { params: { flightId: string } };

export const metadata = { title: "Select seat — Lovair" };

export default function BookPage({ params }: Props) {
  return <BookFlow flightId={params.flightId} />;
}
