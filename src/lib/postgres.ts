import { Pool } from 'pg';

const credentials: object = {
	user: 'postgres',
	host: 'localhost',
	database: 'prelingo',
	password: 'behad2024',
	port: 5432,
};

const pool = new Pool(credentials);

const fetch = async <T>(SQL: string, ...params: any[]): Promise<T | null> => {
	const client = await pool.connect();
	try {
		const {
			rows: [row],
		} = await client.query(SQL, params.length ? params : []);
		return row;
	} finally {
		client.release();
	}
};

const fetchALL = async <T>(
	SQL: string,
	...params: any[]
): Promise<T[] | null> => {
	const client = await pool.connect();
	try {
		const { rows } = await client.query(SQL, params.length ? params : []);
		return rows;
	} finally {
		client.release();
	}
};

export { fetch, fetchALL, pool };
