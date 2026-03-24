export const hookFixture = {
  "openApiTitle": "Swagger Petstore",
  "documentCounts": {
    "models": 3,
    "operations": 3,
    "services": 1
  },
  "lookups": {
    "model": true,
    "operation": true,
    "service": true
  },
  "models": [
    "Error",
    "Pet",
    "Pets"
  ],
  "operations": [
    "createPets",
    "listPets",
    "showPetById"
  ],
  "services": [
    "pets"
  ],
  "hasProject": true
} as const;
