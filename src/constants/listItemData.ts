export namespace ListItemData {
  export const DOCUMENT_TYPE: {
    value:
      | 'ADIT_STAMP'
      | 'ALIEN_REGISTRATION'
      | 'BIRTH_CERTIFICATE'
      | 'BORDER_CROSSING_CARD'
      | 'CEDULA'
      | 'CERTIFICATE_OF_NATURALIZATION'
      | 'CITIZENSHIP_CARD'
      | 'DRIVERS_LICENSE'
      | 'DSP150_FORM'
      | 'EMPLOYEE_AUTHORIZATION'
      | 'GOVERNMENT_ISSUED_ID'
      | 'I512'
      | 'I551'
      | 'I94'
      | 'INTERPOL_NOTICE'
      | 'MILITARY_CARD'
      | 'NATIONAL_ID'
      | 'OTHER'
      | 'PASSPORT'
      | 'REENTRY_PERMIT'
      | 'REFUGEE_PERMIT'
      | 'REFUGEE_TRAVEL_DOCUMENT'
      | 'REFUGEE_ASYLEE'
      | 'TRANSPORTATION_LETTER'
      | 'TRIBAL_CARD'
      | 'TRUSTED_TRAVELER_CARD'
      | 'VISA'
      | 'VOTER_REGISTRATION';
    name: string;
    codes: string[];
  }[] = [
    {value: 'PASSPORT', name: 'Passport', codes: ['P', 'IP', 'PO']},
    {value: 'BIRTH_CERTIFICATE', name: 'Birth Certificate', codes: ['BC']},
    {value: 'NATIONAL_ID', name: 'National ID', codes: ['NI']},
    {value: 'DRIVERS_LICENSE', name: 'Drivers License', codes: ['DL']},
    {value: 'OTHER', name: 'Other', codes: ['O']},
    {value: 'NATIONAL_ID', name: 'Social Security Card', codes: ['SS']},
    {value: 'GOVERNMENT_ISSUED_ID', name: 'ID Card', codes: []},
    {value: 'VISA', name: 'Visa', codes: ['V', 'VN', 'VB', 'IV']},
    {
      value: 'ALIEN_REGISTRATION',
      name: 'A Number',
      codes: [],
    },
    {
      value: 'EMPLOYEE_AUTHORIZATION',
      name: 'Employment Authorization Document',
      codes: ['EAD', 'IA'],
    },
    {
      value: 'VOTER_REGISTRATION',
      name: 'Voter Registration Card',
      codes: ['VR'],
    },
    {value: 'TRIBAL_CARD', name: 'Tribal Card', codes: []},
    {value: 'REFUGEE_ASYLEE', name: 'Refugee Asylee Card', codes: []},
    {
      value: 'REFUGEE_TRAVEL_DOCUMENT',
      name: 'Refugee Travel Document',
      codes: [],
    },
    {value: 'REFUGEE_PERMIT', name: 'Refugee Permit', codes: []},
    {value: 'REENTRY_PERMIT', name: 'Re-Entry Permit', codes: []},
    {value: 'MILITARY_CARD', name: 'Military Card', codes: []},
    {value: 'I94', name: 'I94', codes: []},
    {value: 'I551', name: 'I551', codes: ['A', 'AR', 'A1', 'A2', 'C1', 'C2']},
    {value: 'CEDULA', name: 'CEDULA', codes: []},
  ];

  export const GENDER_TYPE = [
    {displayName: 'MALE', value: 'M'},
    {displayName: 'FEMALE', value: 'F'},
    {displayName: 'Unknown', value: 'U'},
  ];
}
