import { dataSources } from "@/lib/mock/data";
import type { DataSource } from "@/types";

export async function getDataSources(): Promise<DataSource[]> {
	return dataSources;
}

export async function getDataSourceById(id: string): Promise<DataSource | undefined> {
	return dataSources.find((ds) => ds.id === id);
}
