require 'rake'

desc 'run the application on local environment, access at http://localhost:4900 '
task :run do
  pids = [
    spawn("cd rails && bin/rails s -p 3900"),
    spawn("cd ember && ./node_modules/.bin/ember s --port=4900 --proxy http://localhost:3900"),
  ]

  trap "INT" do
    Process.kill "INT", *pids
    exit 1
  end

  loop do
    sleep 1
  end
end
