require 'json'
require 'etc'
require 'time'

# Storage quota source. Returns toy data for now; replace `quotas_for` with a
# real source (e.g. `lfs quota`, `mmlsquota`, `df`, or a Prometheus query) later.
# Row shape matches the PurdueRCAC OOD-Dashboard disk_usage API, but with
# numeric values instead of preformatted strings.
module StorageData
  GB = 1024**3
  TB = 1024**4

  def self.quotas_for(username)
    seed = username.each_char.sum(&:ord)
    [
      row('home',    username,        :used => 38 * GB + seed * 10_000_000, :limit => 50 * GB,
          :files => 210_000, :file_limit => 500_000, :path => "/home/#{username}"),
      row('scratch', username,        :used => 7.4 * TB, :limit => 10 * TB,
          :files => 1_450_000, :file_limit => 5_000_000, :path => "/scratch/#{username}"),
      row('project', 'tuftsrc_lab',   :used => 21 * TB, :limit => 20 * TB,
          :files => 3_800_000, :file_limit => 10_000_000, :path => '/cluster/tufts/tuftsrc_lab'),
      row('archive', 'tuftsrc_lab',   :used => 1.2 * TB, :limit => 25 * TB,
          :files => 52_000, :file_limit => nil, :path => '/archive/tuftsrc_lab')
    ]
  end

  def self.row(type, location, used:, limit:, files:, file_limit:, path:)
    {
      type: type, location: location, path: path,
      used_bytes: used.to_i, limit_bytes: limit.to_i,
      file_count: files, file_limit: file_limit,
      updated_at: Time.now.utc.iso8601
    }
  end
end
