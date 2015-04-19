require "test_helper"

describe Project do
  subject { build(:project) }

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
