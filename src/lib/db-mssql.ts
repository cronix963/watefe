export interface DbConfig {
  host: string;
  database: string;
  user: string;
  password: string;
  port: number;
}

export const dbConfig: DbConfig = {
  host: process.env.DB_HOST || '192.168.100.12',
  database: process.env.DB_NAME || 'dev_SASL',
  user: process.env.DB_USER || 'user_admin',
  password: process.env.DB_PASSWORD || '1234',
  port: parseInt(process.env.DB_PORT || '1433'),
};

export async function executeQuery<T = any>(
  query: string,
  params: any[] = []
): Promise<{ rows: T[]; rowCount: number }> {
  const sql = await import('mssql');
  
  const pool = await sql.connect({
    server: dbConfig.host,
    database: dbConfig.database,
    user: dbConfig.user,
    password: dbConfig.password,
    port: dbConfig.port,
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  });

  const result = await pool.request()
    .input('params', sql.VarChar, JSON.stringify(params))
    .query(params.length > 0 
      ? query.replace(/\?/g, () => `@param${params.indexOf(arguments[1]) || 0}`)
      : query
    );

  await pool.close();
  return { rows: result.recordset as T[], rowCount: result.rowsAffected[0] || 0 };
}

export async function queryDirect<T = any>(
  query: string,
  params: any[] = []
): Promise<{ rows: T[]; rowCount: number }> {
  const sql = await import('mssql');
  
  let paramIndex = 0;
  const formattedQuery = params.length > 0 
    ? query.replace(/\?/g, () => `@p${paramIndex++}`)
    : query;

  const pool = await sql.connect({
    server: dbConfig.host,
    database: dbConfig.database,
    user: dbConfig.user,
    password: dbConfig.password,
    port: dbConfig.port,
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  });

  const request = pool.request();
  params.forEach((value, index) => {
    request.input(`p${index}`, value);
  });

  const result = await request.query(formattedQuery);
  await pool.close();
  
  return { rows: result.recordset as T[], rowCount: result.rowsAffected[0] || 0 };
}

export async function testConnection(): Promise<boolean> {
  try {
    const result = await queryDirect('SELECT 1 as test');
    return result.rows.length > 0;
  } catch (error) {
    console.error('DB Connection failed:', error);
    return false;
  }
}