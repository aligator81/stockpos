import { spawn } from 'child_process';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const migrationCommand = process.argv[2] || 'up';

// Construct the command
const command = 'npx';
const args = [
    'node-pg-migrate',
    migrationCommand,
    '--envPath', '.env',
    '--config-file', 'database.json',
    '--config-value', 'env.development.database=stockpos1',
    '--config-value', `env.development.user=${process.env.DB_USER || 'postgres'}`,
    '--config-value', `env.development.password=${process.env.DB_PASSWORD || '123456'}`,
    '--config-value', `env.development.host=${process.env.DB_HOST || 'localhost'}`,
    '--config-value', `env.development.port=${process.env.DB_PORT || '5432'}`
];

// Run the migration
const migrate = spawn(command, args, {
    stdio: 'inherit',
    shell: true
});

migrate.on('error', (err) => {
    console.error('Failed to start migration:', err);
    process.exit(1);
});

migrate.on('exit', (code) => {
    if (code !== 0) {
        console.error(`Migration process exited with code ${code}`);
        process.exit(code || 1);
    }
    console.log('Migration completed successfully');
});
