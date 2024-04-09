import { samples } from '../samples';

export function SampleConfigurationSelect({
  onChange,
}: {
  onChange: (sampleName: keyof typeof samples) => void;
}) {
  return (
    <>
      <select
        onChange={(ev) => onChange(ev.target.value as keyof typeof samples)}
        className='preset-selector'
      >
        <optgroup label='Basic'>
          <option value='simple'>Simple</option>
          <option value='getNumber'>Get Number</option>
          <option value='trim'>Trim</option>
          <option value='attr'>Get Attribute</option>
          <option value='attrMulti'>Get Multiple Attributes</option>
          <option value='attrAll'>Get All Attributes</option>
        </optgroup>
        <optgroup label='Intermediate'>
          <option value='html'>Get Inner HTML</option>
          <option value='parentHTML'>Get Parent Selector's Inner HTML</option>
          <option value='multiTransform'>Multiple Transformers</option>
        </optgroup>
        <optgroup label='Advanced'>
          <option value='union'>Union Configuration</option>
          <option value='unionDefault'>
            Union Configuration With Default Case
          </option>
        </optgroup>
      </select>
    </>
  );
}
