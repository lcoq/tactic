require 'test_helper'

describe ProjectsController do
  describe 'index with name' do
    it 'ok' do
      create(:project, name: 'project')
      get :index, name: 'pro'
      assert_response :success
    end
    it 'loads projects matching the given name' do
      create(:project, name: 'tactic')
      create(:project, name: 'tactoc')
      create(:project, name: 'other')
      get :index, name: 'tac'
      result['projects'].map { |p| p['name'] }.to_set.must_equal %w{tactic tactoc}.to_set
    end
  end

  def result
    JSON.parse(response.body)
  end
end
