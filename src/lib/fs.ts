import * as fs from 'fs';

export class FS {
	private dir: string;

	constructor(dir: string) {
		this.dir = dir;
	}

	read(): string {
		return fs.readFileSync(this.dir, { encoding: 'utf-8', flag: 'r' });
	}

	write(data: any): void {
		fs.writeFileSync(this.dir, JSON.stringify(data, null, 4));
	}

	delete(): void {
		fs.unlink(this.dir, (err) => {
			if (err && err.code === 'ENOENT') {
				console.info("File doesn't exist, won't remove it.");
			} else if (err) {
				console.error('Error occurred while trying to remove file');
			} else {
				console.info('Removed');
			}
		});
	}
}
