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
    it 'filters by user ids' do
      adrien = create(:user, name: 'adrien')
      louis = create(:user, name: 'louis')
      pom = create(:user, name: 'pom')

      create_list(:entry, 2)
      create_list(:entry, 3, user: adrien)

      entries = [
        create_list(:entry, 4, user: louis),
        create_list(:entry, 5, user: pom)
      ].flatten

      get :index, user_ids: [ louis, pom ].map(&:id)
      result['entries'].map { |r| r['id'] }.to_set.must_equal entries.map(&:id).to_set
    end
    it 'filters by date range' do
      create(:entry, started_at: DateTime.parse('2015-03-26 17:57:30'))
      create(:entry, started_at: DateTime.parse('2015-03-26 20:32:12'))
      entries = [
        create(:entry, started_at: DateTime.parse('2015-03-27 10:12:10')),
        create(:entry, started_at: DateTime.parse('2015-03-28 9:15:58')),
        create(:entry, started_at: DateTime.parse('2015-03-29 19:57:34'))
      ]
      get :index, date_range: [ '2015-03-27', '2015-03-29' ]
      result['entries'].map { |r| r['id'] }.to_set.must_equal entries.map(&:id).to_set
    end
    it 'filters by project ids' do
      tactic = create(:project, name: 'tactic')
      google = create(:project, name: 'google')
      android = create(:project, name: 'android')
      ubuntu = create(:project, name: 'ubuntu')

      create_list(:entry, 2)
      create_list(:entry, 3, project: tactic)
      create_list(:entry, 5, project: ubuntu)

      entries = [
        create_list(:entry, 4, project: google),
        create_list(:entry, 5, project: android)
      ].flatten

      get :index, project_ids: [ google, android ].map(&:id)
      result['entries'].map { |r| r['id'] }.to_set.must_equal entries.map(&:id).to_set
    end
    it 'filters without project' do
      create_list(:entry, 4, project: create(:project))
      create_list(:entry, 5, project: create(:project))
      entries = create_list(:entry, 3)
      get :index, project: false
      result['entries'].map { |r| r['id'] }.to_set.must_equal entries.map(&:id).to_set
    end
  end
  describe 'create' do
    let(:attributes) {
      {
        title: "My entry",
        started_at: '2015-04-18T18:27:48.712Z',
        finished_at: '2015-04-18T22:46:30.892Z',
        user_id: create(:user).id,
        project_id: create(:project).id
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
        e.user_id.must_equal attributes[:user_id]
        e.project_id.must_equal attributes[:project_id]
      end
    end
  end
  describe 'update' do
    let(:entry) { create(:entry) }
    let(:attributes) {
      {
        title: "New title",
        started_at: '2015-04-18T18:27:48.712Z',
        finished_at: '2015-04-18T22:46:30.892Z',
        user_id: create(:user).id,
        project_id: create(:project).id
      }
    }
    it 'ok' do
      put :update, id: entry.id, entry: attributes
      assert_response :success
      result['entry'].wont_be_nil
      result['entry']['title'].must_equal attributes[:title]
    end
    it 'updates entry' do
      put :update, id: entry.id, entry: attributes
      entry.reload.tap do |e|
        e.wont_be_nil
        e.started_at.utc.to_s.must_equal '2015-04-18 18:27:48 UTC'
        e.finished_at.utc.to_s.must_equal '2015-04-18 22:46:30 UTC'
        e.user_id.must_equal attributes[:user_id]
        e.project_id.must_equal attributes[:project_id]
      end
    end
  end
  describe 'destroy' do
    let(:entry) { create(:entry) }
    it 'ok' do
      delete :destroy, id: entry.id
      assert_response :success
      response.body.must_be_empty
    end
    it 'destroys the entry' do
      delete :destroy, id: entry.id
      assert_raises(ActiveRecord::RecordNotFound) { entry.reload }
    end
  end

  def result
    JSON.parse(response.body)
  end
end
