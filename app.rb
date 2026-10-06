require 'sinatra'
require 'json'
require 'etc'
require 'time'
require_relative 'lib/storage_data'

set :bind, '0.0.0.0'
set :public_folder, File.expand_path('public', __dir__)
set :views, File.expand_path('views', __dir__)
enable :static

helpers do
  def current_username
    request.env['REMOTE_USER'] || Etc.getpwuid(Process.uid).name
  rescue StandardError
    ENV['USER'] || 'unknown'
  end
end

get '/' do
  erb :index
end

get '/api/storage' do
  content_type :json
  begin
    { success: true, user: current_username, data: StorageData.quotas_for(current_username) }.to_json
  rescue => e
    status 500
    { success: false, error: e.message }.to_json
  end
end
