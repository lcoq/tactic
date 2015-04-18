require 'test_helper'

describe 'Routes Acceptance Test' do
  it '/api/entries' do
    assert_routing '/api/entries', controller: 'entries', action: 'index'
  end
  it '/api/projects' do
    assert_routing '/api/projects', controller: 'projects', action: 'index'
  end
end
