!function() {
  const targetIdpUid = '71144ab3-ee1a-4401-b7b3-79b44f7daeeb';

  // "Now" for consistent timestamp across all updated docs in this run
  const now = new Date();

  db.accountFca.aggregate([
    { $match: { 'idpIdentityKeys.idpUid': targetIdpUid } },
    {
      $lookup: {
        from: 'pciUserExport',
        let: { uid: targetIdpUid },
        pipeline: [
          { $match: { $expr: { $eq: ['$idpUid', '$$uid'] } } },
          { $project: { _id: 0, idpSub: 1, idpMail: 1 } },
        ],
        as: '_mailMap',
      },
    },
    {
      $set: {
        // Build updated array
        _newKeys: {
          $map: {
            input: { $ifNull: ['$idpIdentityKeys', []] },
            as: 'k',
            in: {
              $cond: [
                { $eq: ['$$k.idpUid', targetIdpUid] },
                {
                  $let: {
                    vars: {
                      matched: {
                        $first: {
                          $filter: {
                            input: '$_mailMap',
                            as: 'm',
                            cond: { $eq: ['$$m.idpSub', '$$k.idpSub'] },
                          },
                        },
                      },
                    },
                    in: {
                      $cond: [
                        { $gt: [{ $type: '$$matched' }, 'missing'] },
                        { $mergeObjects: ['$$k', { idpMail: '$$matched.idpMail' }] },
                        '$$k',
                      ],
                    },
                  },
                },
                '$$k',
              ],
            },
          },
        },
        // Track whether any element actually changed
        _changedFlags: {
          $map: {
            input: { $ifNull: ['$idpIdentityKeys', []] },
            as: 'k',
            in: {
              $let: {
                vars: {
                  matched: {
                    $first: {
                      $filter: {
                        input: '$_mailMap',
                        as: 'm',
                        cond: {
                          $and: [
                            { $eq: ['$$m.idpSub', '$$k.idpSub'] },
                            { $eq: ['$$k.idpUid', targetIdpUid] },
                          ],
                        },
                      },
                    },
                  },
                },
                in: {
                  $cond: [
                    { $gt: [{ $type: '$$matched' }, 'missing'] },
                    { $ne: ['$$k.idpMail', '$$matched.idpMail'] },
                    false,
                  ],
                },
              },
            },
          },
        },
      },
    },
    {
      $set: {
        idpIdentityKeys: '$_newKeys',
        // Set updatedAt only if any flag is true; otherwise keep the existing value
        updatedAt: {
          $cond: [
            { $gt: [{ $size: { $filter: { input: '$_changedFlags', as: 'c', cond: { $eq: ['$$c', true] } } } }, 0] },
            now,
            '$updatedAt',
          ],
        },
      },
    },
    { $unset: ['_mailMap', '_newKeys', '_changedFlags'] },
    { $merge: { into: 'accountFca', on: '_id', whenMatched: 'replace', whenNotMatched: 'discard' } },
  ]);
}();
