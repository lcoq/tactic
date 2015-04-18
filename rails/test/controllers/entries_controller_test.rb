require 'test_helper'

describe EntriesController do
  describe 'index' do
    it 'ok' do
      get :index
      assert_response :success
    end
    it 'loads entries' do
      entries = create_list(:entry, 7)
      get :index
      result['entries'].length.must_equal 7
      result['entries'].map { |r| r['id'] }.to_set.must_equal entries.map(&:id).to_set
    end
  end

  def result
    JSON.parse(response.body)
  end
end
