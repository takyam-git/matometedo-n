exit 1 if !ENV.has_key?('config')
load File.dirname(__FILE__) + "/../../config/#{ENV['config']}.rb"
conf = MatometeDonConfig.new()
if conf.user.nil? || conf.file_path.nil? || conf.host.nil? || conf.user.empty? || conf.file_path.empty? || conf.host.size == 0
   puts "Configファイルを正しく設定してください"
   exit 1
end

set :user, conf.user
set :password, conf.password if !conf.password.nil?
set :ssh_options, conf.ssh_options if !conf.ssh_options.nil?
set :gateway, conf.gateway if !conf.gateway.nil?
role :app, *conf.host

task :tail, :roles => [:app] do
  run "tail -f #{conf.file_path}" do |channel, stream, data|
    puts ">>>#{channel[:host]}>>> #{data.chomp}" 
    break if stream == :err    
  end
end