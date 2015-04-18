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
  describe 'create' do
    let(:attributes) {
      {
        title: "My entry",
        started_at: '2015-04-18T18:27:48.712Z',
        finished_at: '2015-04-18T22:46:30.892Z'
      }
    }
    it 'ok' do
      post :create, entry: attributes
      assert_response :success
      result['entry'].wont_be_nil
      result['entry']['title'].must_equal attributes[:title]
    end
    it 'creates entry' do
      post :create, entry: attributes
      Entry.find_by(title: attributes[:title]).tap do |e|
        e.wont_be_nil
        e.started_at.utc.to_s.must_equal '2015-04-18 18:27:48 UTC'
        e.finished_at.utc.to_s.must_equal '2015-04-18 22:46:30 UTC'
      end
    end
  end

  def result
    JSON.parse(response.body)
  end
end
