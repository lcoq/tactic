# A sample Guardfile
# More info at https://github.com/guard/guard#readme

## Uncomment and set this to only include directories you want to watch
# directories %w(app lib config test)

## Uncomment to clear the screen before every task
# clearing :on

## Guard internally checks for changes in the Guardfile and exits.
## If you want Guard to automatically start up again, run guard in a
## shell loop, e.g.:
##
##  $ while bundle exec guard; do echo "Restarting Guard..."; done
##
## Note: if you are using the `directories` clause above and you are not
## watching the project directory ('.'), then you will want to move
## the Guardfile to a watched dir and symlink it back, e.g.
#
#  $ mkdir config
#  $ mv Guardfile config/
#  $ ln -s config/Guardfile .
#
# and, you'll have to watch "config/Guardfile" instead of "Guardfile"

guard(:minitest, all_on_start: false) do
  watch(%r{^test/(.+)_test\.rb$})
  watch(%r{^test/test_helper\.rb$})        { 'test' }
  watch(%r{^app/models/(.+)\.rb$})         { |m| "test/models/#{m[1]}_test.rb" }
  watch(%r{^app/controllers/(.+)\.rb$})    { |m| "test/controllers/#{m[1]}_test.rb" }
  watch(%r{^config/routes\.rb$})           { |m| "test/routes" }
  watch(%r{^lib/(.+)\.rb$})                { |m| "test/lib/#{m[1]}_test.rb" }
end
notification :emacs
notification :tmux
