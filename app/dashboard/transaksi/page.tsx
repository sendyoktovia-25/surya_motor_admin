import TransaksiContent from "./TransaksiContent";

export default async function TransaksiPage(
  searchParams: Promise<{ page: string }>,
) {
  const { page } = await searchParams;
  return <TransaksiContent page={parseInt(page, 10) || 1} />;
}
