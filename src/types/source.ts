export interface DataSource {
	id: string;
	name: string;
	url: string;
	description: string;
	last_synced: string;
}

export interface SourceAttribution {
	data_source_id: string;
	retrieval_date: string;
	original_url: string | null;
}
