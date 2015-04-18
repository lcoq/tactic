class Entry
  def self.all
    [
        {
          id: 3,
          title: 'Adrien a commence tactic',
          startedAt: '2015-02-11T11:23:00Z',
          finishedAt: '2015-02-11T12:59:00Z',
          project: nil
        }, {
          id: 2,
          title: 'Et il entend Louis ronfler au-dessus pendant ce temps',
          startedAt: '2015-02-09T10:01:00Z',
          finishedAt: '2015-02-09T10:47:00Z',
          project: nil
        }, {
          id: 1,
          title: 'First entry',
          startedAt: '2015-02-11T11:23:00Z',
          finishedAt: '2015-02-11T12:59:00Z',
          project: nil
        }
    ]
  end
end
