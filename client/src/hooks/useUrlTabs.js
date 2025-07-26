import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Custom hook for URL-based tab navigation
 * Manages tab state through URL query parameters for better UX and shareability
 * 
 * @param {string} defaultTab - Default tab to show if no tab is specified in URL
 * @param {Array<string>} validTabs - Array of valid tab names
 * @param {string} paramName - URL parameter name (default: 'tab')
 * @returns {Object} Object containing current tab, tab change handler, and search params
 */
export const useUrlTabs = (defaultTab, validTabs = [], paramName = 'tab') => {
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Get current tab from URL query parameter
    const currentTab = searchParams.get(paramName) || defaultTab;
    
    // Validate and redirect if invalid tab
    useEffect(() => {
        const tabParam = searchParams.get(paramName);
        
        // If tab parameter exists but is not valid, redirect to default
        if (tabParam && validTabs.length > 0 && !validTabs.includes(tabParam)) {
            const newParams = new URLSearchParams(searchParams);
            newParams.set(paramName, defaultTab);
            setSearchParams(newParams);
        }
        
        // If no tab parameter and we have valid tabs, set default
        if (!tabParam && validTabs.length > 0) {
            const newParams = new URLSearchParams(searchParams);
            newParams.set(paramName, defaultTab);
            setSearchParams(newParams);
        }
    }, [searchParams, setSearchParams, defaultTab, validTabs, paramName]);
    
    // Function to handle tab changes
    const handleTabChange = (tabName) => {
        if (validTabs.length === 0 || validTabs.includes(tabName)) {
            const newParams = new URLSearchParams(searchParams);
            newParams.set(paramName, tabName);
            setSearchParams(newParams);
        }
    };
    
    // Function to get tab URL for links
    const getTabUrl = (tabName) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set(paramName, tabName);
        return `?${newParams.toString()}`;
    };
    
    // Function to check if tab is active
    const isTabActive = (tabName) => {
        return currentTab === tabName;
    };
    
    return {
        currentTab,
        handleTabChange,
        getTabUrl,
        isTabActive,
        searchParams,
        setSearchParams,
        validTabs,
    };
};

/**
 * Custom hook for URL-based step navigation (for multi-step forms/processes)
 * Similar to useUrlTabs but specifically designed for numbered steps
 * 
 * @param {number} defaultStep - Default step number (default: 1)
 * @param {Array<number>} validSteps - Array of valid step numbers
 * @param {string} paramName - URL parameter name (default: 'step')
 * @returns {Object} Object containing current step, step change handler, and utilities
 */
export const useUrlSteps = (defaultStep = 1, validSteps = [], paramName = 'step') => {
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Get current step from URL query parameter
    const currentStep = parseInt(searchParams.get(paramName)) || defaultStep;
    
    // Validate and redirect if invalid step
    useEffect(() => {
        const stepParam = searchParams.get(paramName);
        const stepNumber = parseInt(stepParam);
        
        // If step parameter exists but is not valid, redirect to default
        if (stepParam && validSteps.length > 0 && !validSteps.includes(stepNumber)) {
            const newParams = new URLSearchParams(searchParams);
            newParams.set(paramName, defaultStep.toString());
            setSearchParams(newParams);
        }
        
        // If no step parameter and we have valid steps, set default
        if (!stepParam && validSteps.length > 0) {
            const newParams = new URLSearchParams(searchParams);
            newParams.set(paramName, defaultStep.toString());
            setSearchParams(newParams);
        }
    }, [searchParams, setSearchParams, defaultStep, validSteps, paramName]);
    
    // Function to handle step changes
    const handleStepChange = (stepNumber) => {
        if (validSteps.length === 0 || validSteps.includes(stepNumber)) {
            const newParams = new URLSearchParams(searchParams);
            newParams.set(paramName, stepNumber.toString());
            setSearchParams(newParams);
        }
    };
    
    // Function to go to next step
    const goToNextStep = () => {
        if (validSteps.length > 0) {
            const currentIndex = validSteps.indexOf(currentStep);
            if (currentIndex !== -1 && currentIndex < validSteps.length - 1) {
                handleStepChange(validSteps[currentIndex + 1]);
            }
        } else {
            handleStepChange(currentStep + 1);
        }
    };
    
    // Function to go to previous step
    const goToPreviousStep = () => {
        if (validSteps.length > 0) {
            const currentIndex = validSteps.indexOf(currentStep);
            if (currentIndex > 0) {
                handleStepChange(validSteps[currentIndex - 1]);
            }
        } else if (currentStep > 1) {
            handleStepChange(currentStep - 1);
        }
    };
    
    // Function to check if step is active
    const isStepActive = (stepNumber) => {
        return currentStep === stepNumber;
    };
    
    // Function to check if step is completed (current step is higher)
    const isStepCompleted = (stepNumber) => {
        return currentStep > stepNumber;
    };
    
    // Function to get step URL
    const getStepUrl = (stepNumber) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set(paramName, stepNumber.toString());
        return `?${newParams.toString()}`;
    };
    
    return {
        currentStep,
        handleStepChange,
        goToNextStep,
        goToPreviousStep,
        getStepUrl,
        isStepActive,
        isStepCompleted,
        searchParams,
        setSearchParams,
        validSteps,
    };
};

/**
 * Utility function to create tab configuration objects
 * Helps standardize tab definitions across components
 * 
 * @param {Array} tabs - Array of tab objects with { key, label, component?, icon? }
 * @returns {Object} Object with tab utilities
 */
export const createTabConfig = (tabs) => {
    const validTabs = tabs.map(tab => tab.key);
    const defaultTab = tabs.length > 0 ? tabs[0].key : '';
    
    const getTabByKey = (key) => tabs.find(tab => tab.key === key);
    const getTabLabel = (key) => getTabByKey(key)?.label || key;
    const getTabIcon = (key) => getTabByKey(key)?.icon;
    const getTabComponent = (key) => getTabByKey(key)?.component;
    
    return {
        tabs,
        validTabs,
        defaultTab,
        getTabByKey,
        getTabLabel,
        getTabIcon,
        getTabComponent,
    };
};

/**
 * Example usage:
 * 
 * // For Profile component:
 * const profileTabs = createTabConfig([
 *   { key: 'profile', label: 'Profile Settings', icon: '👤' },
 *   { key: 'orders', label: 'Order History', icon: '📦' },
 *   { key: 'addresses', label: 'Address Book', icon: '📍' },
 * ]);
 * 
 * const { currentTab, handleTabChange, isTabActive } = useUrlTabs(
 *   profileTabs.defaultTab,
 *   profileTabs.validTabs
 * );
 * 
 * // For Checkout component:
 * const { currentStep, handleStepChange, isStepActive, isStepCompleted } = useUrlSteps(
 *   1,
 *   [1, 2, 3]
 * );
 */
