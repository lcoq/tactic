require 'test_helper'

describe UsersController do
  describe 'index' do
    it 'ok' do
      get :index
      assert_response :success
    end
    it 'loads users' do
      users = create_list(:user, 4)
      get :index
      result['users'].length.must_equal users.length
      result['users'].map { |r| r['id'] }.to_set.must_equal users.map(&:id).to_set
    end
  end

  def result
    JSON.parse(response.body)
  end
end
