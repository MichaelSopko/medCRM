import objection from 'objection';

export default class SoftDeleteQueryBuilder extends objection.QueryBuilder {
	constructor(modelClass) {
		super(modelClass);

		this.onBuild(builder => {
			if (!builder.context().withDeleted) {
				builder.where('deleted', false);
			}
		});
	}

	withDeleted(withDeleted) {
		this.context().withDeleted = withDeleted;
		return this;
	}

	softDelete() {
		return this.patch({ deleted: false });
	}
};
