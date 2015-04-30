require "test_helper"

describe User do
  subject { build(:user) }

  it 'saves' do
    assert subject.save
  end
  it 'is valid' do
    assert subject.valid?
  end
  it 'needs name' do
    subject.name = nil
    refute subject.valid?
  end
end
