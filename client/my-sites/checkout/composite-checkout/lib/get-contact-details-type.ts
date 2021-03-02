/**
 * External dependencies
 */
import type { ResponseCart } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import type { ContactDetailsType } from '../types/contact-details';
import {
	hasDomainRegistration,
	hasTransferProduct,
	hasOnlyRenewalItems,
} from 'calypso/lib/cart-values/cart-items';
import { isGSuiteProductSlug, isGoogleWorkspaceProductSlug } from 'calypso/lib/gsuite';
import doesPurchaseHaveFullCredits from './does-purchase-have-full-credits';

export default function getContactDetailsType( responseCart: ResponseCart ): ContactDetailsType {
	const hasDomainProduct =
		hasDomainRegistration( responseCart ) || hasTransferProduct( responseCart );
	const hasOnlyRenewals = hasOnlyRenewalItems( responseCart );

	if ( hasDomainProduct && ! hasOnlyRenewals ) {
		return 'domain';
	}

	// Hides account information form if the user is only purchasing G Suite of Google Workspace extra licenses
	const hasNewGSuite = responseCart.products.some( ( product ) => {
		if ( isGSuiteProductSlug( product.product_slug ) ) {
			return true;
		}

		if ( isGoogleWorkspaceProductSlug( product.product_slug ) ) {
			// Checks if that property exists has it should only exist for extra licenses
			return product?.extra?.new_quantity === undefined;
		}

		return false;
	} );

	if ( hasNewGSuite && ! hasOnlyRenewals ) {
		return 'gsuite';
	}

	const isPurchaseFree = responseCart.total_cost_integer === 0;
	const isFullCredits = doesPurchaseHaveFullCredits( responseCart );

	if ( isPurchaseFree && ! isFullCredits ) {
		return 'none';
	}

	return 'tax';
}
