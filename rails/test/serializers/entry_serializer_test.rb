require 'test_helper'

describe EntrySerializer do
  let(:entry) { build(:entry) }
  subject { serialize(entry) }

  it 'id' do
    entry.save!
    subject['entry'].wont_be_nil
    subject['entry']['id'].must_equal entry.id
  end
  it 'title' do
    subject['entry']['title'].must_equal entry.title
  end
  it 'started_at' do
    expected = "2015-04-09T15:54:41.548Z"
    entry.started_at = DateTime.parse(expected)
    subject['entry']['started_at'].must_equal expected
  end
  it 'finished_at' do
    expected = "2015-04-09T15:54:41.548Z"
    entry.finished_at = DateTime.parse(expected)
    subject['entry']['finished_at'].must_equal expected
  end
  it 'project_id' do
    project = create(:project)
    entry.project = project
    subject['entry']['project_id'].must_equal project.id
  end
  it 'loads the project' do
    project = create(:project)
    entry.project = project
    subject['projects'].wont_be_nil
    subject['projects'].length.must_equal 1
    subject['projects'][0]['id'].must_equal project.id
  end
  it 'user_id' do
    entry.user.save!
    subject['entry']['user_id'].must_equal entry.user.id
  end
  it 'does not load the user' do
    entry.user.save!
    subject['users'].must_be_nil
  end

  def serialize(entry)
    JSON.parse(EntrySerializer.new(entry).to_json)
  end
end
