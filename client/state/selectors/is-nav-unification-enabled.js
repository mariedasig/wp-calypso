/**
 * External dependencies
 */
import cookie from 'cookie';

/**
 * Internal dependencies
 */
import { isAutomatticTeamMember } from 'calypso/reader/lib/teams';
import { getReaderTeams } from 'calypso/state/teams/selectors';
import { getCurrentUserId, getCurrentUserDate } from 'calypso/state/current-user/selectors';

const LAUNCH_DATE = new Date( Date.UTC( 2021, 2, 10, 9, 0, 0, 0 ) ); // Stands for Mar 10, 2021 09:00:00.
const CURRENT_ROLLOUT_SEGMENT_PERCENTAGE = 5;

export default ( state ) => {
	const userDate = getCurrentUserDate( state );
	const userId = getCurrentUserId( state );
	// Disable if explicitly requested by the `?disable-nav-unification` query param.
	if ( new URL( document.location ).searchParams.has( 'disable-nav-unification' ) ) {
		return false;
	}

	// New Users.
	if ( userDate && new Date( userDate ) - LAUNCH_DATE > 0 ) {
		return true;
	}

	// Users belonging to the current segment.
	if (
		userId &&
		new Date() - LAUNCH_DATE > 0 &&
		userId % 100 < CURRENT_ROLLOUT_SEGMENT_PERCENTAGE
	) {
		return true;
	}

	// Enable nav-unification for all a12s.
	if ( isAutomatticTeamMember( getReaderTeams( state ) ) ) {
		return true;
	}

	// Enable for E2E tests checking Nav Unification.
	// @see https://github.com/Automattic/wp-calypso/pull/50144.
	const cookies = cookie.parse( document.cookie );
	if ( cookies.flags && cookies.flags.includes( 'nav-unification' ) ) {
		return true;
	}

	// Disabled by default.
	return false;
};
