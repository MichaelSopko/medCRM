import knex from '../connector'

const safeParse = (json, deflt = []) => {
  try {
    if (json == null) {
      return deflt;
    }
    return JSON.parse(json || `${deflt}`);
  } catch (e) {
    console.error('JSON parse error', json, e);
    return deflt;
  }
};

export default class Treatments {

  async getSeries({ patient_id, clinic_id, therapist_id }) {
    const query = knex('treatment_series');

    if (patient_id) {
      query.where('patient_id', patient_id);
    } else if (clinic_id) {
      query.where('clinic_id', clinic_id);
    } else if (therapist_id) {
      const treatments = await knex('treatments')
        .whereRaw('JSON_CONTAINS(`therapist_ids`, ?) AND deleted = false', [therapist_id])
        .select();
      const series = await query.whereIn('id', treatments.map(({ series_id }) => series_id)).select();
      return series.map(s => ({
        ...s,
        treatments: treatments.filter(t => +t.series_id === +s.id),
      }));
    }

    return query.andWhere('deleted', false)
      .orderBy('id', 'DESC')
      .select();
  }
	
	async getTreatmentsList({ patient_id, clinic_id, therapist_id }) {
		const query = knex('treatments');
		
		if (patient_id) {
			query.where('patient_id', patient_id);
		} else if (clinic_id) {
			query.where('clinic_id', clinic_id);
		} else if (therapist_id) {
			query.where('therapist_ids', therapist_id);
		}
		
		return query.andWhere('deleted', false)
			.orderBy('id', 'DESC')
			.select();
	}
	
	getTreatmentObjects({ patient_id, clinic_id, therapist_id }) {
		const query = knex('treatments_objects');
		
		if (patient_id) {
			query.where('patient_id', patient_id);
		} else if (clinic_id) {
			query.where('clinic_id', clinic_id);
		} else if (therapist_id) {
			query.andwhere('therapist_ids', [therapist_id]);
		}
		
		return query.andWhere('deleted', false)
			.orderBy('id', 'DESC')
			.select();
	}

  getSeriesByPatient(patient_id) {
    return knex('treatment_series')
      .where('patient_id', patient_id)
      .andWhere('deleted', false)
      .orderBy('id', 'DESC')
      .select();
  }

  async findOne(id) {
    const [series, treatments] = await Promise.all([
      knex('treatment_series')
        .where('id', id)
        .andWhere('deleted', false)
        .first(),
      knex('treatments')
        .where('series_id', id)
        .andWhere('deleted', false)
        .select()
        .then(treatments => Promise.all(treatments.map(async (treatment) => {
          const therapists = await knex('users').whereIn('id', safeParse(treatment.therapist_ids)).select();
          return {
            ...treatment,
            therapists,
          };
        }))),
    ]);
    series.treatments = treatments || [];
    return series;
  }

  findOneTreatment(id) {
    return knex('treatments')
      .where('id', id)
      .first();
  }

	async isTreatmentExistsByTime(start_date, end_date, id) {
		const res =  await knex('treatments')
			.where(function () {
				if (id) this.whereNot('id', id);
				this.whereNot('deleted', true);
				this.whereBetween('start_date', [start_date, end_date]);
			})
			.orWhere(function () {
				if (id) this.whereNot('id', id);
				this.whereNot('deleted', true);
				this.whereBetween('end_date', [start_date, end_date]);
			})
			.count();
		return res[0]['count(*)'];
	}

  getTreatments(series_id) {
    return knex('treatments')
      .where('series_id', series_id)
      .andWhere('deleted', false)
      .select();
  }

  addSeries(fields) {
    return knex('treatment_series')
      .insert(fields)
      .returning('*');
  }

  editSeries({ id, ...fields }) {
    return knex('treatment_series')
      .where('id', id)
      .update(fields);
  }

  deleteSeries({ id }) {
    return knex('treatments')
      .where('series_id', id)
      .update('deleted', true)
      // .delete()
      .then(() => knex('treatment_series')
          .where('id', id)
          .update('deleted', true),
        // .delete();
      );
  }

  addTreatment(fields) {
    if ('therapist_ids' in fields) {
      fields.therapist_ids = JSON.stringify(fields.therapist_ids);
    }
    if ('patient_ids' in fields) {
      fields.patient_ids = JSON.stringify(fields.patient_ids);
    }
    return knex('treatments')
      .insert(fields)
      .returning('*');
  }

  editTreatment({ id, ...fields }) {
    if ('therapist_ids' in fields) {
      fields.therapist_ids = JSON.stringify(fields.therapist_ids);
    }
    if ('patient_ids' in fields) {
      fields.patient_ids = JSON.stringify(fields.patient_ids);
    }
    return knex('treatments')
      .where('id', id)
      .update(fields);
  }

  deleteTreatment({ id }) {
    return Promise.all([
      knex('treatments')
        .where('id', id)
        .update('deleted', true),
      // .delete()
    ]);
  }

}
