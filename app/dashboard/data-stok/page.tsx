import DataStokContent from "./DataStokContent";

export default async function DataStokPage(
  searchParams: Promise<{ page: string }>,
) {
  const { page } = await searchParams;
  return <DataStokContent page={parseInt(page, 10) || 1} />;
}
