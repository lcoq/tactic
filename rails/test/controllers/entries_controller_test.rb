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
    it 'loads entries projects' do
      projects = create_list(:project, 2)
      create_list(:entry, 3, project: projects[0])
      create_list(:entry, 4, project: projects[1])
      get :index
      result['projects'].length.must_equal 2
      result['projects'].map { |r| r['id'] }.to_set.must_equal projects.map(&:id).to_set
    end
  end

  def result
    JSON.parse(response.body)
  end
end
