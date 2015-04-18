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

desc 'deploy local `master` branch to the heroku remote repository'
task :deploy do |t, args|
  branch = 'master'

  sh 'git checkout heroku-builds'

  # compile ember app assets into rails public folder and commit
  sh "git merge #{branch} -m 'Merging #{branch} for deployment'"
  sh 'cd ember && ember build --output-path ../rails/public && cd ..'

  unless `git status -s` == ''
    sh 'git add -A'
    sh 'git commit -m "Asset compilation for deployment"'
  end

  # push the rails folder to heroku/master
  sh 'git push heroku `git subtree split -P rails`:master'

  # switch to your initial branch
  sh 'git checkout -'
end
