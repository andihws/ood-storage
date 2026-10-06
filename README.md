# Storage

Open OnDemand app showing per-user and per-group storage quotas (disk and file count).
Structured like `tufts-systemstatus`: Sinatra, no Gemfile, runs under Passenger.

**Currently serves toy data.** Replace `StorageData.quotas_for` in `lib/storage_data.rb` with a real source.

## Layout

- `app.rb` - Sinatra routes: `/` page, `/api/storage` JSON
- `lib/storage_data.rb` - quota source (toy data)
- `views/index.erb`, `public/script.js`, `public/styles.css` - UI
- `manifest.yml`, `config.ru` - OOD metadata and Rack entry

## Install (dev)

```bash
mkdir -p ~/ondemand/dev
cp -r storage ~/ondemand/dev/storage     # or git clone into ~/ondemand/dev/storage
```

Open OnDemand > Develop > My Sandbox Apps > Storage. After edits: `touch tmp/restart.txt`.

## API

`GET /api/storage` returns `{success, user, data: [{type, location, path, used_bytes, limit_bytes, file_count, file_limit, updated_at}]}`.
`file_limit` is `null` when the filesystem has no file limit.
