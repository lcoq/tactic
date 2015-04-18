require 'test_helper'

describe 'Routes Acceptance Test' do
  it '/api/entries' do
    assert_routing({ path: '/api/entries', method: :post }, controller: 'entries', action: 'create')
    assert_routing({ path: '/api/entries/1', method: :put }, controller: 'entries', action: 'update', id: '1')
    assert_routing({ path: '/api/entries/1', method: :delete }, controller: 'entries', action: 'destroy', id: '1')
    assert_routing '/api/entries', controller: 'entries', action: 'index'
  end
  it '/api/projects' do
    assert_routing '/api/projects', controller: 'projects', action: 'index'
  end
end
