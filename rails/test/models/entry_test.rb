require 'test_helper'

describe Entry do
  subject { build(:entry) }

  it 'saves' do
    assert subject.save
  end
  it 'is valid' do
    assert subject.valid?
  end
  it 'needs started at' do
    subject.started_at = nil
    refute subject.valid?
  end
  it 'needs finished at' do
    subject.finished_at = nil
    refute subject.valid?
  end
  it 'needs to finish after start' do
    subject.finished_at = subject.started_at - 2.hours
    refute subject.valid?
  end
  it 'can finish and start at the same time' do
    subject.finished_at = subject.started_at
    assert subject.valid?
  end
end
