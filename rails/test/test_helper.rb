ENV['RAILS_ENV'] ||= 'test'

require File.expand_path('../../config/environment', __FILE__)
require 'rails/test_help'

require 'minitest/rails'

module TestCaseExtension
  extend ActiveSupport::Concern

  included do
    include FactoryGirl::Syntax::Methods
    before do
      DatabaseCleaner.start
    end
    after do
      DatabaseCleaner.clean
    end
  end
end

class ::Minitest::Spec
  include TestCaseExtension
end
class ActiveSupport::TestCase
  include TestCaseExtension
end
