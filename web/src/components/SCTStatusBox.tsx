/*
SCT Status Box component for displaying Soulbound Credential Token ownership status.
Shows loading, has SCT, no SCT, or error states with animated icons.
*/

import { useState, useEffect, useContext } from 'react';
import { SecretJsContext, SCTStatus } from '../secretjs/SecretJsContext';
import { usePollStore } from '../context/PollStoreContext';
import './SCTStatusBox.css';

const SCTStatusBox = () => {
    const secretJsContext = useContext(SecretJsContext);
    const { secretJsFunctions } = usePollStore();
    const [isChecking, setIsChecking] = useState(false);

    // Always call hooks in the same order - get sctStatus and setSctStatus from context
    const sctStatus = secretJsContext?.sctStatus;
    const setSctStatus = secretJsContext?.setSctStatus;

    // Check SCT status when wallet connects or changes
    useEffect(() => {
        const checkSCT = async () => {
            if (!secretJsContext?.secretJs || !secretJsContext?.secretAddress || isChecking || !setSctStatus) {
                return;
            }

            console.log('Starting SCT status check...');
            setIsChecking(true);
            setSctStatus(SCTStatus.LOADING);

            try {
                const hasSCT = await secretJsFunctions.checkSCTOwnership();
                console.log('SCT check completed, hasSCT:', hasSCT);
                setSctStatus(hasSCT ? SCTStatus.HAS_SCT : SCTStatus.NO_SCT);
            } catch (error) {
                console.error('SCT status check failed:', error);
                setSctStatus(SCTStatus.ERROR);
            } finally {
                setIsChecking(false);
            }
        };

        // Only run if we have wallet connection and aren't already checking
        if (secretJsContext?.secretJs && secretJsContext?.secretAddress && !isChecking) {
            checkSCT();
        }
    }, [secretJsContext?.secretJs, secretJsContext?.secretAddress]);

    // Don't render if no wallet connected - moved after all hooks
    if (!secretJsContext?.secretAddress) {
        return null;
    }

    const handleClick = async () => {
        if (isChecking || !secretJsContext?.secretJs || !setSctStatus) return;

        console.log('Manual SCT status check triggered...');
        setIsChecking(true);
        setSctStatus(SCTStatus.LOADING);

        try {
            const hasSCT = await secretJsFunctions.checkSCTOwnership();
            console.log('Manual SCT check completed, hasSCT:', hasSCT);
            setSctStatus(hasSCT ? SCTStatus.HAS_SCT : SCTStatus.NO_SCT);
        } catch (error) {
            console.error('Manual SCT status check failed:', error);
            setSctStatus(SCTStatus.ERROR);
        } finally {
            setIsChecking(false);
        }
    };

    const getStatusClass = () => {
        switch (sctStatus) {
            case SCTStatus.LOADING:
                return 'sct-status-loading';
            case SCTStatus.HAS_SCT:
                return 'sct-status-has';
            case SCTStatus.NO_SCT:
                return 'sct-status-no';
            case SCTStatus.ERROR:
                return 'sct-status-error';
            default:
                return '';
        }
    };

    const getStatusIcon = () => {
        switch (sctStatus) {
            case SCTStatus.LOADING:
                return <div className="sct-loading-spinner" />;
            case SCTStatus.HAS_SCT:
                return <div className="sct-checkmark" />;
            case SCTStatus.NO_SCT:
                return <div className="sct-cross" />;
            case SCTStatus.ERROR:
                return <div className="sct-warning" />;
            default:
                return <div className="sct-loading-spinner" />;
        }
    };

    const getStatusText = () => {
        switch (sctStatus) {
            case SCTStatus.LOADING:
                return 'SCT';
            case SCTStatus.HAS_SCT:
                return 'SCT';
            case SCTStatus.NO_SCT:
                return 'SCT';
            case SCTStatus.ERROR:
                return 'SCT';
            default:
                return 'SCT';
        }
    };

    const getTooltipText = () => {
        switch (sctStatus) {
            case SCTStatus.LOADING:
                return 'Checking SCT status...';
            case SCTStatus.HAS_SCT:
                return 'You have a Soulbound Credential Token';
            case SCTStatus.NO_SCT:
                return 'You do not have a Soulbound Credential Token';
            case SCTStatus.ERROR:
                return 'Error checking SCT status. Click to retry.';
            default:
                return 'Checking SCT status...';
        }
    };

    return (
        <button 
            className={`sct-status-box ${getStatusClass()}`}
            onClick={handleClick}
            disabled={isChecking}
            title={getTooltipText()}
            aria-label={getTooltipText()}
        >
            <div className="sct-status-icon">
                {getStatusIcon()}
            </div>
            <span>{getStatusText()}</span>
        </button>
    );
};

export default SCTStatusBox; 