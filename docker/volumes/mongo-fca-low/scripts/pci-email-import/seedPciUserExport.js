!function () {
  // Ensure exact content
  db.pciUserExport.deleteMany({});

  const docs = [
    {
      idpUid: '71144ab3-ee1a-4401-b7b3-79b44f7daeeb',
      idpSub: 'sub-A',
      idpMail: 'alice+new@example.com',
      createdAt: new Date('2024-06-15T12:34:56Z'),
    },
    {
      idpUid: '71144ab3-ee1a-4401-b7b3-79b44f7daeeb',
      idpSub: 'sub-B',
      idpMail: 'bob@example.com',
      createdAt: new Date('2024-06-15T12:34:56Z'),
    },
    {
      idpUid: '71144ab3-ee1a-4401-b7b3-79b44f7daeeb',
      idpSub: 'sub-new-1',
      idpMail: 'new1@example.com',
      createdAt: new Date('2024-06-15T12:34:56Z'),
    },
    {
      idpUid: '71144ab3-ee1a-4401-b7b3-79b44f7daeeb',
      idpSub: 'sub-new-2',
      idpMail: 'new2@example.com',
      createdAt: new Date('2024-06-15T12:34:56Z'),
    },
    {
      idpUid: '71144ab3-ee1a-4401-b7b3-79b44f7daeeb',
      idpSub: 'date-A',
      idpMail: 'alice@example.com',
      createdAt: new Date('2024-06-15T12:34:56Z'),
    },
    {
      idpUid: '71144ab3-ee1a-4401-b7b3-79b44f7daeeb',
      idpSub: 'date-B',
      idpMail: 'bob@example.com',
      createdAt: new Date('2024-01-05T00:00:00Z'),
    },
    {
      idpUid: '71144ab3-ee1a-4401-b7b3-79b44f7daeeb',
      idpSub: 'date-C',
      idpMail: 'jean1@fia1.fr',
      createdAt: new Date('2025-01-31T09:00:00Z'),
    },
  ];

  for (let i = 0; i < 10; i++) {
    docs.push({
      idpUid: '71144ab3-ee1a-4401-b7b3-79b44f7daeeb',
      idpSub: `bulk-${i}`,
      idpMail: `toto${i}@example.fr`,
    });
  }

  const result = db.pciUserExport.insertMany(docs, { ordered: true });
  print(`Inserted ${result.insertedCount || Object.keys(result.insertedIds || {}).length} documents into pciUserExport`);
}();
