require 'test_helper'

describe UserSerializer do
  let(:user) { build(:user) }
  subject { serialize(user) }

  it 'id' do
    user.save!
    subject['user'].wont_be_nil
    subject['user']['id'].must_equal user.id
  end
  it 'name' do
    subject['user']['name'].must_equal user.name
  end

  def serialize(user)
    JSON.parse(UserSerializer.new(user).to_json)
  end
end
