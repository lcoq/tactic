require 'test_helper'

describe 'Routes Acceptance Test' do
  it '/api/entries' do
    assert_routing '/api/entries', controller: 'entries', action: 'index'
  end
end
